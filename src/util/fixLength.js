/**
 * Fix the String length
 *
 * @param   {num} values of String
 * @param   {num} values of String
 * @returns {length} Largest number found
 */
export default function (num, length) {
    return ('' + num).length < length ? ((new Array(length + 1)).join('0') + num).slice(-length) : '' + num;
}
