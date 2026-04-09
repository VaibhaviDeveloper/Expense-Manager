import type { PageOptions } from "../core/page-option.js";
import type { iFriend } from "../models/friend.model.js";
import { AppDBManager } from "../models/db-manager.js";

export class FriendRepository {
    private static instance: FriendRepository;
    private friends: iFriend[] = [];
    private dbManager = AppDBManager.getInstance();

    static getInstance() {
        if (!FriendRepository.instance) {
            FriendRepository.instance = new FriendRepository();
        }
        return FriendRepository.instance;
    }

    private constructor() {
        this.loadFriendsFromDB();
    }

    private loadFriendsFromDB() {
        const friendsTable = this.dbManager.getDB().table('friends');
        this.friends = (friendsTable || []) as unknown as iFriend[];
        console.log('Friends loaded from database:', this.friends.length, 'friends');
    }

    private async persistToDB() {
        try {
            const db = this.dbManager.getDB();

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
            await this.persistToDB();
            return friend;
        } catch (err) {
            console.error('Error persisting friend:', err);
            this.friends.pop(); // rollback
            return null;
        }
    }

    removeFriend(id: string): boolean {
        const index = this.friends.findIndex(friend => friend.id === id);

        if (index !== -1) {
            this.friends.splice(index, 1);
            this.persistToDB().catch(err => console.error('Error persisting removal:', err));
            return true;
        }

        return false;
    }

    findFriendById(id: string) {
        return this.friends.find(friend => friend.id === id);
    }

    getAllFriends(): iFriend[] {
    return this.friends;
}

    // ✅ SAFE COMPARISONS
    findFriendByEmail(email: string) {
        if (!email) return undefined;

        return this.friends.find(
            friend => (friend.email || "").toLowerCase() === email.toLowerCase()
        );
    }

    findFriendByPhone(phone: string) {
        if (!phone) return undefined;

        return this.friends.find(
            friend => (friend.phone || "") === phone
        );
    }

    findFriendByName(name: string) {
        if (!name) return undefined;

        return this.friends.find(
            friend => (friend.name || "").toLowerCase() === name.toLowerCase()
        );
    }

    // ✅ 🔥 FIXED SEARCH (MAIN BUG FIX)
    searchFriends(query: string, pageOption?: PageOptions) {
        const lowerQuery = (query || "").toLowerCase().trim();

        // ✅ If empty query → return all
        const filtered = !lowerQuery
            ? this.friends
            : this.friends.filter(friend => {
                const name = (friend.name || "").toLowerCase();
                const email = (friend.email || "").toLowerCase();
                const phone = (friend.phone || "");

                return (
                    name.includes(lowerQuery) ||
                    email.includes(lowerQuery) ||
                    phone.includes(lowerQuery)
                );
            });

        const offset = pageOption?.offset || 0;
        const limit = pageOption?.limit || 5;

        return {
            data: filtered.slice(offset, offset + limit),
            matched: filtered.length,
            total: this.friends.length
        };
    }

    updateFriend(id: string, updatedData: Partial<Omit<iFriend, 'id'>>): iFriend | null {
        const index = this.friends.findIndex(friend => friend.id === id);

        if (index === -1) {
            return null;
        }

        this.friends[index] = {
            ...this.friends[index],
            ...updatedData
        } as iFriend;

        console.log('Friend updated in repository:', this.friends[index]);

        this.persistToDB().catch(err => console.error('Error persisting update:', err));

        return this.friends[index];
    }
}