const DICTIONARY = "_-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export const counter = () => {
  const sequence: string[] = [DICTIONARY[0]];

  return () => {
    const str = sequence.join("");
    let carry = 0;

    for (let i = 0; i < sequence.length; i++) {
      const index = DICTIONARY.indexOf(sequence[i]) + carry + 1;

      if (index < DICTIONARY.length) {
        sequence[i] = DICTIONARY[index];

        /**
         * Make sure the following rules are not violated:
         *
         * 1. The first character cannot be a number.
         * 2. The second character cannot be a number if the first is a dash.
         * 3. The dash cannot be the only character.
         *
         * https://www.w3.org/TR/CSS21/syndata.html#characters
         */
        const [c1, c2] = sequence;
        if (
          (c1 >= "0" && c1 <= "9") ||
          (c1 === "-" && c2 >= "0" && c2 <= "9") ||
          (c1 === "-" && sequence.length === 1)
        ) {
          i--;
          continue;
        }

        carry = 0;
        break;
      } else {
        sequence[i] = DICTIONARY[0];
        carry = 1;
      }
    }
    if (carry) sequence.push(DICTIONARY[0]);

    return str;
  };
};
