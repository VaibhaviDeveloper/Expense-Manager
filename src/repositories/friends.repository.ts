import type { PageOptions } from "../core/page-option.js";
import type { iFriend } from "../models/friend.model.js";
import { AppDBManager } from "../models/db-manager.js";

export class FriendRepository{
    private static instance: FriendRepository;
    private friends:iFriend[] = [];
    private dbManager = AppDBManager.getInstance();
    
    static getInstance(){
        if(!FriendRepository.instance){
            FriendRepository.instance = new FriendRepository();
        }
        return FriendRepository.instance;
    }

    private constructor(){
        this.loadFriendsFromDB();
    }

    private loadFriendsFromDB() {
        const friendsTable = this.dbManager.getDB().table('friends');
        this.friends = friendsTable as unknown as iFriend[];
        console.log('Friends loaded from database:', this.friends.length, 'friends');
    }

    private async persistToDB() {
    try {
        const db = this.dbManager.getDB();
        console.log("DB object:", db);

        if (!(db as any).dataStore) {
            throw new Error("dataStore is undefined");
        }

        (db as any).dataStore.friends = [...this.friends];

        
        await this.dbManager.save();

        console.log("Save successful ✅");

    } catch (err) {
        console.error('❌ Error persisting friends to database:', err);
        throw err;
    }
}
    
   async addFriend(friend: iFriend) {
    this.friends.push(friend);
    console.log('Friend added to repository:', friend);

    try {
        await this.persistToDB(); // ✅ wait for DB
        return friend;
    } catch (err) {
        console.error('Error persisting friend:', err);

        // rollback
        this.friends.pop();

        return null;
    }
}

    removeFriend(id:string): boolean {
        const index = this.friends.findIndex(friend => friend.id === id);
        if(index !== -1){
            this.friends.splice(index, 1);
            this.persistToDB().catch(err => console.error('Error persisting removal:', err));
            return true;
        }
        return false;
    }

    findFriendById(id:string){
        return this.friends.find(friend=>friend.id === id)
    }

    findFriendByEmail(email:string){
        return this.friends.find(friend=>friend.email === email)
    }

    findFriendByPhone(phone:string){
        return this.friends.find(friend=>friend.phone === phone)
    }

    findFriendByName(name:string){
        return this.friends.find(friend=>friend.name === name)
    }

    searchFriends(query:string,pageOption?:PageOptions){
        const lowerQuery = query.toLowerCase();
        const filtered = this.friends.filter(friend =>
            friend.name.toLowerCase().includes(lowerQuery) ||
            friend.email.toLowerCase().includes(lowerQuery) ||
            friend.phone.toLowerCase().includes(lowerQuery)
        );

        return {
            data:filtered.slice((pageOption?.offset || 0), (pageOption?.offset || 0) + (pageOption?.limit || 5)),
            matched: filtered.length,
            total:this.friends.length
        }
    }

    updateFriend(id: string, updatedData: Partial<Omit<iFriend, 'id'>>): iFriend | null {
        const index = this.friends.findIndex(friend => friend.id === id);
        if (index === -1) {
            return null;
        }
        this.friends[index] = { ...this.friends[index], ...updatedData } as iFriend;
        console.log('Friend updated in repository:', this.friends[index]);
        this.persistToDB().catch(err => console.error('Error persisting update:', err));
        return this.friends[index]!;
    }
}