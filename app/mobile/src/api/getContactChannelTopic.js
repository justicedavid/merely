import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getContactChannelTopic(server, token, channelId, topicId) {
  var insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
  var protocol = insecure ? 'http' : 'https';
  let topic = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/topics/${topicId}/detail?contact=${token}`, 
    { method: 'GET' });
  checkResponse(topic)
  return await topic.json()
}

