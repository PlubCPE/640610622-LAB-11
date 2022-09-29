import { checkToken } from "../../../../../backendLibs/checkToken";
import {
  readChatRoomsDB,
  writeChatRoomsDB,
} from "../../../../../backendLibs/dbLib";

export default function roomIdMessageIdRoute(req, res) {
  //get ids from url
  const roomId = req.query.roomId;
  const messageId = req.query.messageId;

  //check token
  const user = checkToken(req);
  if (!user) {
    return res.status(401).json({
      ok: false,
      message: "You don't permission to access this api",
    });
  }
  const rooms = readChatRoomsDB();

  //check if roomId exist
  const room = rooms.find((x) => x.roomId === roomId);
  if (room === "undefined") {
    return res.status(404).json({ ok: false, message: "Invalid room id" });
  }
  //check if messageId exist
  const findmessage = room.messages.find((x) => x.messageId === messageId);
  if (findmessage === "undefined") {
    return res.status(404).json({ ok: false, message: "Invalid message Id" });
  }
  //check if token owner is admin, they can delete any message
  if (user.isAdmin) {
    room.messages = room.messages.filter((x) => x.messageId !== messageId);

    rooms.messages = room.messages;
    writeChatRoomsDB(rooms);
    return res.json({ ok: true });
  } else {
    //or if token owner is normal user, they can only delete their own message!
    if (findmessage.username !== user.username) {
      return res.status(403).json({
        ok: false,
        message: "You don't have permission to access this data",
      });
    } else {
      room.messages = room.messages.filter((x) => x.messageId !== messageId);

      rooms.messages = room.messages;
      writeChatRoomsDB(rooms);
      return res.status(200).json({ ok: true });
    }
  }
}
