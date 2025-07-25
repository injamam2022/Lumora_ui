export interface RoomData {
  stat: number;
  msg: string;
  list_count: number;
  all_list: Room[];
}

export interface Room {
  room_id: string;
  room_name: string;
  room_type: string;
  section_area_id: string;
  created_at: string;
  updated_at: string;
  del_status: string;
}

export interface AddRoomPayload {
  roomName: string;
  roomType: string;
  sectionAreaId: string;
}

export interface GetSingleRoom {
  stat: number;
  msg: string;
  list_count: number;
  all_list: AllList[];
}

export interface AllList {
  room_id: string;
  room_name: string;
  room_type: string;
  section_area_id: string;
  created_at: string;
  updated_at: string;
  del_status: string;
}

export interface DeleteRoom {
  stat: number;
  msg: string;
}
