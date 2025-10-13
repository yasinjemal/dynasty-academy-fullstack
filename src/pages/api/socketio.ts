import { NextApiRequest } from 'next';
import { NextApiResponseWithSocket, initializeSocketIO } from '@/lib/socketio/server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method === 'GET' || req.method === 'POST') {
    initializeSocketIO(res);
    res.status(200).json({ message: 'Socket.IO server is running' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
