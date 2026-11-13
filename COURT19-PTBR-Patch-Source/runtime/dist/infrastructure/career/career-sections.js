const minNameLength = 4;
const maxNameLength = 16;
function isSectionName(bytes, start, length) {
    for (let i = 0; i < length; i++) {
        const byte = bytes[start + i];
        if (byte < 0x61 || byte > 0x7a)
            return false;
    }
    return true;
}
export function findCareerSections(bytes) {
    const found = [];
    for (let offset = 0; offset + 4 + minNameLength < bytes.length; offset++) {
        const length = bytes[offset];
        if (length < minNameLength || length > maxNameLength || bytes[offset + 1] !== 0 || bytes[offset + 2] !== 0 || bytes[offset + 3] !== 0)
            continue;
        const nameStart = offset + 4;
        if (nameStart + length >= bytes.length)
            continue;
        if (bytes[nameStart + length] !== 0x01 || !isSectionName(bytes, nameStart, length))
            continue;
        found.push({ name: String.fromCharCode(...bytes.subarray(nameStart, nameStart + length)), offset });
        offset = nameStart + length;
    }
    return found.map((section, index) => ({
        ...section,
        byteLength: (found[index + 1]?.offset ?? bytes.length) - section.offset,
    }));
}
export function sectionBounds(sections, name) {
    const section = sections.find((candidate) => candidate.name === name);
    return section === undefined ? undefined : { start: section.offset, end: section.offset + section.byteLength };
}
