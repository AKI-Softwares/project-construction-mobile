import { useLocalSearchParams } from 'expo-router';
import { RoomScreen } from '@/screens/RoomScreen';

export default function RoomRoute() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId: string }>();
  if (!id || !roomId) return null;
  return <RoomScreen visitId={Number(id)} roomId={Number(roomId)} />;
}
