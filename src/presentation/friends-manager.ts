import { numberValidator } from "../core/validators/number-validator.js";
import { FriendsController } from "../controller/friends.controller.js";
import { openInteractionManager, type Choice } from "./interaction-manager.js";
import type { iFriend } from "../models/friend.model.js";

const controller = new FriendsController();

const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "List All Friends", value: "3" },
  { label: "Update Friend", value: "4" },
  { label: "Remove Friend", value: "5" },
  { label: "Back", value: "6" },
];

const addFriend = async (ask: any)=>{
    try {
        
        const name = await ask('Enter friend name: ');
        if (controller.checkNameExists(name)) {
            console.log('\n✗ Friend with this name already exists.');
            return;
        }

        let email;
        do {
            email = await ask('Enter friend email: ');
            if (controller.checkEmailExists(email)) {
                console.log('Email already exists. Please enter a different email.');
            }
        } while (controller.checkEmailExists(email));

        let phone;
        do {
            phone = await ask('Enter friend phone number: ');
            if (controller.checkPhoneExists(phone)) {
                console.log('Phone number already exists. Please enter a different phone number.');
            }
        } while (controller.checkPhoneExists(phone));

        const address = await ask('Enter friend address: ');
        const openingBalance = await ask('Enter opening balance (positive means they owe you, negative means you owe them): ', { validator: numberValidator });

        const friend = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            address,
            balance: Number(openingBalance)
        };

        const result = controller.addFriend(friend);
        
        if(result.success === 'true') {
            console.log('\n✓ Friend added successfully!', result.data);
        } else {
            console.log('\n✗ Failed to add friend.');
        }
    } catch(error) {
        console.error('Error adding friend:', error);
    }
};

const searchFriend = async (ask: any)=>{
    const query = await ask('Enter name, email or phone to search: ');
    const result = controller.searchFriends(query);
    const payload = result.data;
    console.log(`\nFound ${payload.matched} matching friends (showing ${payload.data.length} of ${payload.total} total):`);

    if (payload.data.length > 0) {
        // Use console.table for clean tabular display
        const tableData = payload.data.map(friend => ({
            Name: friend.name,
            Email: friend.email,
            Phone: friend.phone,
            Balance: friend.balance,
            Address: friend.address
        }));
        console.table(tableData);
    } else {
        console.log('No friends found matching your search.');
    }
};

const listAllFriends = () => {
    const result = controller.searchFriends(''); // Empty query to get all friends
    const payload = result.data;
    console.log(`\nAll Friends (${payload.total} total):`);

    if (payload.data.length > 0) {
        const tableData = payload.data.map(friend => ({
            Name: friend.name,
            Email: friend.email,
            Phone: friend.phone,
            Balance: friend.balance,
            Address: friend.address
        }));
        console.table(tableData);
    } else {
        console.log('No friends in the system.');
    }
};

const updateFriend = async (ask: any, choose: any)=>{
    try {
        // First, let user choose how to identify the friend to update
        const updateOption = await choose(
            '\nUpdate friend by:',
            [
                { label: 'Email', value: '1' },
                { label: 'Phone', value: '2' },
                { label: 'Cancel', value: '3' }
            ]
        );

        if(updateOption?.value === '3') {
            return;
        }

        // Get the identifier
        let identifier;
        if(updateOption?.value === '1') {
            identifier = await ask('Enter friend email: ');
        } else {
            identifier = await ask('Enter friend phone: ');
        }

        // Find the friend first to show current data
        let currentFriend;
        if(updateOption?.value === '1') {
            currentFriend = controller.getFriendByEmail(identifier);
        } else {
            currentFriend = controller.getFriendByPhone(identifier);
        }

        if(!currentFriend) {
            console.log('\n✗ Friend not found.');
            return;
        }

        console.log('\nCurrent friend data:');
        console.table({
            Name: currentFriend.name,
            Email: currentFriend.email,
            Phone: currentFriend.phone,
            Address: currentFriend.address,
            Balance: currentFriend.balance
        });

        // Ask for updated data
        console.log('\nEnter new values (press Enter to keep current value):');
        const newName = await ask(`Name (${currentFriend.name}): `);
        const newEmail = await ask(`Email (${currentFriend.email}): `);
        const newPhone = await ask(`Phone (${currentFriend.phone}): `);
        const newAddress = await ask(`Address (${currentFriend.address}): `);
        const newBalanceInput = await ask(`Balance (${currentFriend.balance}): `, { validator: numberValidator });

        // Build update object with only non-empty values
        const updates: Partial<Omit<iFriend, 'id'>> = {};
        
        if(newName && newName.trim()) updates.name = newName.trim();
        if(newEmail && newEmail.trim()) updates.email = newEmail.trim();
        if(newPhone && newPhone.trim()) updates.phone = newPhone.trim();
        if(newAddress && newAddress.trim()) updates.address = newAddress.trim();
        if(newBalanceInput && newBalanceInput.trim()) updates.balance = Number(newBalanceInput.trim());

        if(Object.keys(updates).length === 0) {
            console.log('\n✗ No changes made.');
            return;
        }

        // Update the friend
        const result = controller.updateFriend(currentFriend.id, updates);
        
        if(result.success === 'true') {
            console.log('\n✓ Friend updated successfully!');
            console.log('Updated data:', result.data);
        } else {
            console.log('\n✗ Failed to update friend. Email or phone already exists.');
        }
    } catch(error) {
        console.error('Error updating friend:', error);
    }
};

const removeFriend = async (ask: any, choose: any)=>{
    try {
        const removeOption = await choose(
            '\nRemove friend by:',
            [
                { label: 'Email', value: '1' },
                { label: 'Phone', value: '2' },
                { label: 'Cancel', value: '3' }
            ]
        );

        if(removeOption?.value === '3') {
            return;
        }

        let result;
        if(removeOption?.value === '1') {
            const email = await ask('Enter friend email: ');
            result = controller.removeFriendByEmail(email);
        } else {
            const phone = await ask('Enter friend phone: ');
            result = controller.removeFriendByPhone(phone);
        }

        if(result.success === 'true') {
            console.log('\n✓ Friend removed successfully!');
        } else {
            console.log('\n✗ Failed to remove friend. Friend not found.');
        }
    } catch(error) {
        console.error('Error removing friend:', error);
    }
};

export const manageFriends = async (ask: any, choose: any)=>{
    while(true){
        const choice = await choose('\n--- Manage Friends ---', options, false);

        switch(choice!.value){
            case '1':
                await addFriend(ask);
                break;
            case '2':
                await searchFriend(ask);
                break;
            case '3':
                listAllFriends();
                break;
            case '4':
                await updateFriend(ask, choose);
                break;
            case '5':
                await removeFriend(ask, choose);
                break;
            case '6':
                console.log('Going back...');
                return;
        }
    }
};