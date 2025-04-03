import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function getChannelTopics(server, token, channelId, revision, count, begin, end) {
  const insecure = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|:\d+$|$)){4}$/.test(server);
  const protocol = insecure ? 'http' : 'https';

  var rev = ''
  if (revision != null) {
    rev = `&revision=${revision}`
  }
  var cnt = ''
  if (count != null) {
    cnt = `&count=${count}`
  }
  var bgn = ''
  if (begin != null) {
    bgn = `&begin=${begin}`
  }
  var edn = ''
  if (end != null) {
    edn = `&end=${end}`
  }
  var topics = await fetchWithTimeout(`${protocol}://${server}/content/channels/${channelId}/topics?agent=${token}${rev}${cnt}${bgn}${edn}`, 
    { method: 'GET' });
  checkResponse(topics)
  return { 
    marker: topics.headers.get('topic-marker'),
    revision: topics.headers.get('topic-revision'),
    topics: await topics.json(),
  }
}

