import { numberValidator } from "../core/validators/number-validator.js";
import { FriendsController } from "../controller/friends.controller.js";
import { openInteractionManager, type Choice } from "./interaction-manager.js";

const controller = new FriendsController();

const options: Choice[] = [
  { label: "Add Friend", value: "1" },
  { label: "Search Friend", value: "2" },
  { label: "Update Friend", value: "3" },
  { label: "Remove Friend", value: "4" },
  { label: "Back", value: "5" },
];

const addFriend = async (ask: any)=>{
    try {
        const name = await ask('Enter friend name: ');
        const email = await ask('Enter friend email: ');
        const phone = await ask('Enter friend phone number: ');
        const openingBalance = await ask('Enter opening balance (positive means they owe you, negative means you owe them): ', { validator: numberValidator });

        const friend = {
            id: Date.now().toString(),
            name,
            email,
            phone,
            balance: Number(openingBalance)
        };

        const result = controller.addFriend(friend);
        
        if(result.success === 'true') {
            console.log('\n✓ Friend added successfully!', result.data);
        } else {
            console.log('\n✗ Failed to add friend. Email or phone already exists.');
        }
    } catch(error) {
        console.error('Error adding friend:', error);
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
                console.log('Searching friend...');
                break;
            case '3':
                console.log('Updating friend...');
                break;
            case '4':
                await removeFriend(ask, choose);
                break;
            case '5':
                console.log('Going back...');
                return;
        }
    }
};