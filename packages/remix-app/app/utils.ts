export function normalizeRoomName(room: string) {
  return room
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .replace(/_/g, "-")
    .toLowerCase();
}
