import { emailValidator } from "../core/validators/email-validator.js";
import { phoneValidator } from "../core/validators/phoneNumber-validator.js";
import { requiredValidator } from "../core/validators/empty-validator.js";
import { FriendsController } from "../controller/friends.controller.js";
import type { iFriend } from "../models/friend.model.js";

const controller = new FriendsController();

type Choice = { label: string; value: string };

const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "List All Friends", value: "3" },
  { label: "Update Friend", value: "4" },
  { label: "Remove Friend", value: "5" },
  { label: "Back", value: "6" },
];


const addFriend = async (ask: any) => {
  const name = await ask('Enter friend name: ', { validator: requiredValidator('name') });

  let email: string;
  while (true) {
    email = await ask('Enter friend email: ', { validator: requiredValidator('email')  });

    if (!emailValidator(email)) {
      console.log('❌ Invalid email format.');
      continue;
    }

    if (controller.checkEmailExists(email)) {
      console.log('❌ Email already exists.');
      continue;
    }

    break;
  }

  let phone: string;
  while (true) {
    phone = await ask('Enter friend phone number: ', { validator: requiredValidator('phone') });

    if (!phoneValidator(phone)) {
      console.log('❌ Invalid phone number.');
      continue;
    }

    if (controller.checkPhoneExists(phone)) {
      console.log('❌ Phone already exists.');
      continue;
    }

    break;
  }

  const address = await ask('Enter friend address: ', { validator: requiredValidator('address') });

  let balance: number;
  while (true) {
    const input = await ask('Enter opening balance: ', { validator: requiredValidator('balance') });

    balance = Number(input);
    if (isNaN(balance)) {
      console.log('❌ Enter a valid number.');
      continue;
    }

    break;
  }

  const friend: iFriend = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim(),
    address: address.trim(),
    balance
  };

  const result = await controller.addFriend(friend);

  if (result.success === 'true') {
    console.log('\n✅ Friend added successfully!');
    console.table(result.data);
  } else {
    console.log('\n❌ Failed to add friend.');
  }
};



const searchFriend = async (ask: any) => {
  const query = await ask('Enter name/email/phone: ', { validator: requiredValidator });

  const result = controller.searchFriends(query);
  const payload = result.data;

  console.log(`\nFound ${payload.matched} friend(s)`);

  if (payload.data.length > 0) {
    console.table(payload.data);
  } else {
    console.log('No friends found.');
  }
};



const listAllFriends = () => {
  const result = controller.getAllFriends();
  const friends = result.data;

  console.log(`\nAll Friends (${friends.length})`);

  if (friends.length > 0) {
    console.table(friends);
  } else {
    console.log('No friends available.');
  }
};



const updateFriend = async (ask: any, choose: any) => {
  const option = await choose('Update by:', [
    { label: 'Email', value: '1' },
    { label: 'Phone', value: '2' },
    { label: 'Cancel', value: '3' }
  ]);

  if (option.value === '3') return;

  let identifier: string;

  if (option.value === '1') {
    identifier = await ask('Enter email: ', { validator: requiredValidator });
    if (!emailValidator(identifier)) {
      console.log('❌ Invalid email.');
      return;
    }
  } else {
    identifier = await ask('Enter phone: ', { validator: requiredValidator });
    if (!phoneValidator(identifier)) {
      console.log('❌ Invalid phone.');
      return;
    }
  }

  const current = option.value === '1'
    ? controller.getFriendByEmail(identifier)
    : controller.getFriendByPhone(identifier);

  if (!current) {
    console.log('❌ Friend not found.');
    return;
  }

  console.table(current);
  console.log('\nPress Enter to skip field');

  const newName = await ask(`Name (${current.name}): `);
  const newEmail = await ask(`Email (${current.email}): `);
  const newPhone = await ask(`Phone (${current.phone}): `);
  const newAddress = await ask(`Address (${current.address}): `);
  const newBalance = await ask(`Balance (${current.balance}): `);

  const updates: Partial<Omit<iFriend, 'id'>> = {};

  if (newName?.trim()) updates.name = newName.trim();

  if (newEmail?.trim()) {
    if (!emailValidator(newEmail)) {
      console.log('❌ Invalid email.');
      return;
    }
    if (controller.checkEmailExists(newEmail)) {
      console.log('❌ Email exists.');
      return;
    }
    updates.email = newEmail.trim();
  }

  if (newPhone?.trim()) {
    if (!phoneValidator(newPhone)) {
      console.log('❌ Invalid phone.');
      return;
    }
    if (controller.checkPhoneExists(newPhone)) {
      console.log('❌ Phone exists.');
      return;
    }
    updates.phone = newPhone.trim();
  }

  if (newAddress?.trim()) updates.address = newAddress.trim();

  if (newBalance?.trim()) {
    const val = Number(newBalance);
    if (!isNaN(val)) updates.balance = val;
  }

  if (Object.keys(updates).length === 0) {
    console.log('❌ No changes.');
    return;
  }

  const result = controller.updateFriend(current.id, updates);

  if (result.success === 'true') {
    console.log('✅ Updated successfully');
    console.table(result.data);
  } else {
    console.log('❌ Update failed');
  }
};



const removeFriend = async (ask: any, choose: any) => {
  try {
    const option = await choose(
      '\nRemove friend by:',
      [
        { label: 'Email', value: '1' },
        { label: 'Phone', value: '2' },
        { label: 'Cancel', value: '3' }
      ]
    );

    if (option.value === '3') return;

    let identifier: string;
    let friend;

    
    if (option.value === '1') {
      identifier = await ask('Enter friend email: ', {
        validator: requiredValidator
      });

      if (!emailValidator(identifier)) {
        console.log('❌ Invalid email.');
        return;
      }

      friend = controller.getFriendByEmail(identifier);
    } else {
      identifier = await ask('Enter friend phone: ', {
        validator: requiredValidator
      });

      if (!phoneValidator(identifier)) {
        console.log('❌ Invalid phone number.');
        return;
      }

      friend = controller.getFriendByPhone(identifier);
    }

    
    if (!friend) {
      console.log('\n❌ Friend not found.');
      return;
    }

    
    console.log('\n⚠️ You are about to delete this friend:');
    console.table(friend);

   
    const confirm = await ask('Type YES to confirm deletion: ');

    const isConfirmed = confirm?.trim().toLowerCase() === 'yes';

    if (!isConfirmed) {
      console.log('❌ Deletion cancelled.');
      return;
    }

    
    const result = option.value === '1'
      ? controller.removeFriendByEmail(identifier)
      : controller.removeFriendByPhone(identifier);

    if (result.success === 'true') {
      console.log('\n✅ Friend deleted successfully!');
    } else {
      console.log('\n❌ Failed to delete.');
    }

  } catch (error) {
    console.error('Error removing friend:', error);
  }
};



export const manageFriends = async (ask: any, choose: any) => {
  while (true) {
    const choice = await choose('\n--- Manage Friends ---', options, false);

    switch (choice.value) {
      case '1': await addFriend(ask); break;
      case '2': await searchFriend(ask); break;
      case '3': listAllFriends(); break;
      case '4': await updateFriend(ask, choose); break;
      case '5': await removeFriend(ask, choose); break;
      case '6': return;
    }
  }
};