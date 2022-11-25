#!/usr/bin/env python3

#######################################################################################################################
#                                                                                                                     #
# This is a script that converts a file that contains raw ascii art into                                              #
# vim royale readable ascii art, with only '0' (empty character), '1' (halfplain character) and '2' (plain character) #
#                                                                                                                     #
# For more informations, run: 'python3 transform.py' or './transform.py' (only possible on GNU/Linux based systems)   #
#                                                                                                                     #
#######################################################################################################################


import os
import sys
import argparse


class Char(str):
    pass


class InvalidCharError(Exception):
    pass


def read_file(filename: str, *args) -> str:
    with open(filename, 'r', *args) as f:
        content = f.read()

    return content


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Transforms a text file containing ASCII art to 0, 1 and 2 (to put into /vim_royale_view/src/ascii_art/ascii_text.txt)")

    parser.add_argument("-f", "--input-file", metavar="input_file", type=str, required=True, help="File that contains raw ascii art")
    parser.add_argument("-o", "--output-file", metavar="output_file", type=str, required=True, help="Output file which will contain 0, 1 and 2 as a readable format for vim royale")
    parser.add_argument("--ignore-errors", action="store_true", help="Ignores error, replaces every char that is neither 'plain_char', 'halfplain_char' or 'empty_char' by 'empty_char'")
    parser.add_argument("--plain-char", metavar="plain_char", required=True, help="Plain character of ascii art")
    parser.add_argument("--halfplain-char", metavar="halfplain_char", nargs="?", default=" ", help="Half plain character of ascii art")
    parser.add_argument("--empty-char", metavar="empty_char", required=False, nargs="?", default=" ", help="Plain character of ascii art")

    return parser.parse_args()


def convert_to_vim_royale_readable(
    ascii_art: str,
    plain_char: str,
    halfplain_char: str,
    empty_char: str,
    ignore_errors: bool = False
) -> str:
    result: str = ""

    for char in ascii_art:
        if char == plain_char:
            result += "2"
        elif char == halfplain_char:
            result += "1"
        elif char == empty_char:
            result += "0"
        elif char == '\n':
            result += '\n'
        else:
            if ignore_errors:
                result += "0"
                continue

            raise InvalidCharError(f"invalid character found in 'ascii_art': '{char}', it's neither 'plain_char', 'halfplain_char' or 'empty_char'")

    return result


def main() -> None:
    args: argparse.Namespace = parse_args()

    if not os.path.isfile(args.input_file):
        sys.stderr.write(f"Input file ('{args.input_file}') not found, exiting...")
        sys.exit(1)

    if os.path.exists(args.output_file):
        if read_file(args.output_file):
            sys.stderr.write(f"Output file ('{args.output_file}') is not empty, exiting...")
            sys.exit(1)


    with open(args.output_file, 'w') as f:
        f.write(
            convert_to_vim_royale_readable(
                read_file(args.input_file),
                plain_char=args.plain_char,
                halfplain_char=args.halfplain_char,
                empty_char=args.empty_char,
                ignore_errors=args.ignore_errors
            )
        )


if __name__ == "__main__":
    main()
