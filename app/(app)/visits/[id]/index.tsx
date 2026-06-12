import { useLocalSearchParams } from 'expo-router';
import { VisitDetailScreen } from '@/screens/VisitDetailScreen';

export default function VisitDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VisitDetailScreen id={Number(id)} />;
}
