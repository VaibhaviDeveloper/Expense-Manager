import * as readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";

export interface AskOptions {
  defaultAnswer?: string;
  validator?: (s: string) => boolean;
}

export interface Choice {
  label: string;
  value: string;
}

export const openInteractionManager = () => {
  const rl = readline.createInterface({ input, output });

  const ask = async (
    question: string,
    options?: AskOptions
  ): Promise<string | undefined> => {
    const { defaultAnswer, validator } = options || {};

    while (true) {
      const answer: string = await new Promise((resolve) => {
        rl.question(
          `${question}${defaultAnswer ? ` (${defaultAnswer})` : ""} `,
          resolve
        );
      });

      if (validator && !validator(answer)) {
        continue;
      }

      return answer || defaultAnswer;
    }
  };

  
  const choose = async (
    question: string,
    choices: Choice[],
    optional?: boolean
  ): Promise<Choice | undefined> => {
    console.log("\n" + question);

    choices.forEach((choice) => {
      console.log(`${choice.value}. ${choice.label}`);
    });

    const input = await ask("Enter your choice: ", {
      validator: (value) => {
        const trimmed = value.trim();

        if (optional && trimmed === "") return true;

        const firstPart = trimmed.split(/[\s.]/)[0];
        return choices.some((c) => c.value === firstPart);
      },
    });

    const selectedValue = input?.trim().split(/[\s.]/)[0];
    return choices.find((c) => c.value === selectedValue);
  };

  
  const close = () => {
    rl.close();
  };

  return {
    ask,
    choose,
    close,
  };
};