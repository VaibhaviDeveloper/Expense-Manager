import { openInteractionManager } from "./src/presentation/interaction-manager.js"
import { manageFriends } from "./src/presentation/friends-manager.js"

const run = async ()=>{
    const {close,choose,ask} = openInteractionManager();
    let continueApp = true;
    
    while (continueApp) {
        console.log("\n=== Expense Manager ===\n");
        
        const mainMenu = await choose("What would you like to do?", [
            { label: "Manage Friends", value: "1" },
            { label: "Manage Groups", value: "2" },
            { label: "Manage Expenses", value: "3" },
            { label: "View Reports", value: "4" },
            { label: "Exit", value: "5" }
        ]);
        
        switch (mainMenu?.value) {
            case "1":
                await manageFriends(ask, choose);
                break;
            case "2":
                await manageGroupsMenu(ask, choose);
                break;
            case "3":
                await manageExpensesMenu(ask, choose);
                break;
            case "4":
                await viewReportsMenu(ask, choose);
                break;
            case "5":
                console.log("\nGoodbye!");
                continueApp = false;
                break;
        }
    }
    
    close();
};

const manageGroupsMenu = async (ask: any, choose: any) => {
    const groupOption = await choose("\n--- Manage Groups ---", [
        { label: "Create Group", value: "1" },
        { label: "Add Member", value: "2" },
        { label: "Remove Member", value: "3" },
        { label: "Update Group", value: "4" },
        { label: "Back to Main Menu", value: "5" }
    ]);
    
    switch (groupOption?.value) {
        case "1":
            console.log("Create Group selected");
            break;
        case "2":
            console.log("Add Member selected");
            break;
        case "3":
            console.log("Remove Member selected");
            break;
        case "4":
            console.log("Update Group selected");
            break;
    }
};

const manageExpensesMenu = async (ask: any, choose: any) => {
    const expenseOption = await choose("\n--- Manage Expenses ---", [
        { label: "Add Expense", value: "1" },
        { label: "Update Expense", value: "2" },
        { label: "Delete Expense", value: "3" },
        { label: "Back to Main Menu", value: "4" }
    ]);
    
    switch (expenseOption?.value) {
        case "1":
            console.log("Add Expense selected");
            break;
        case "2":
            console.log("Update Expense selected");
            break;
        case "3":
            console.log("Delete Expense selected");
            break;
    }
};

const viewReportsMenu = async (ask: any, choose: any) => {
    const reportOption = await choose("\n--- View Reports ---", [
        { label: "Personal Expenses", value: "1" },
        { label: "Group Expenses", value: "2" },
        { label: "Settlement Report", value: "3" },
        { label: "Back to Main Menu", value: "4" }
    ]);
    
    switch (reportOption?.value) {
        case "1":
            console.log("Personal Expenses Report selected");
            break;
        case "2":
            console.log("Group Expenses Report selected");
            break;
        case "3":
            console.log("Settlement Report selected");
            break;
    }
};

run().catch(console.error);