import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

export interface AskOptions {
  defaultAnswer?: string | undefined;
  validator?: ((s: string) => boolean) | undefined;
}

export interface Choice {
  label: string;
  value: string;
}


export const openInteractionManager = () => {
  const rl = readline.createInterface({ input, output });
  const ask:(question: string, options?: AskOptions)=>Promise<string|undefined> = async (question: string, options?: AskOptions) => {
    const { defaultAnswer, validator } = options || {};
    return new Promise((resolve) => {
      rl.question(
        question + `${defaultAnswer ? "(" + defaultAnswer + ")" : ""}`,
        async (answer: string) => {
          if (validator && !validator(answer)) {
            console.log("Invalid");
            const result = await ask(question, { defaultAnswer, validator });
            resolve(result);
          } else {
            resolve(answer || defaultAnswer);
          }
        },
      );
    });
  };
  const choose:(question: string, choices: Choice[],optional?:boolean)=>Promise<Choice|undefined>=async (question: string, choices: Choice[],optional)=> {
    console.log(question);
    choices.forEach((choice) => {
      console.log(`${choice.value}. ${choice.label}`);
    });
    const choice = await ask("Please your choice: ", {
      validator: (input) =>{
        const trimmedInput = input.trim();
        // Check if input starts with a valid choice value
        if(optional && trimmedInput === ''){
          return true;
        }
        // Extract first part before space or take the whole input
        const firstPart = trimmedInput.split(/[\s.]/)[0];
        return choices.some((choice) => choice.value === firstPart);
      },
    });
    //  Extract just the choice value from the input
    const choiceValue = choice?.trim().split(/[\s.]/)[0];
    return choices!.find(c=>c.value===choiceValue)
  };

  const close = ()=>{
    rl.close();
  }
  return {
    ask,
    choose,
    close
  }
};
