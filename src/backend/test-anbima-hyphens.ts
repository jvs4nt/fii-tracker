import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

async function test(headers: any) {
  console.log('Testing with headers:', JSON.stringify(headers));
  try {
    const response = await axios.get('https://api.anbima.com.br/feed/fundos/v2/fundos', {
      params: { size: 1 },
      headers
    });
    console.log('✅ SUCCESS!');
  } catch (error: any) {
    console.error('❌ FAILED:', error.response?.status, JSON.stringify(error.response?.data));
  }
}

(async () => {
  const CID = 'o6HoR26GFtJp';
  const SEC = 'EpDiMNtll50g';
  const AUTH = Buffer.from(`${CID}:${SEC}`).toString('base64');
  
  // Get OAuth token
  const oauthRes = await axios.post('https://api.anbima.com.br/oauth/access-token', 
    { grant_type: 'client_credentials' },
    { headers: { 'Authorization': `Basic ${AUTH}` } }
  );
  const token = oauthRes.data.access_token;
  console.log('OAuth Token obtained.');

  await test({ 'client_id': CID, 'access_token': token });
  await test({ 'client-id': CID, 'access-token': token });
  await test({ 'client_id': CID, 'Authorization': `Bearer ${token}` });
})();
