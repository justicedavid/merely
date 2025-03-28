import { checkResponse, fetchWithTimeout } from './fetchUtil';

export async function addChannelTopic(token, channelId, datatype, message, assets ) {

  if (message == null && (assets == null || assets.length === 0)) {
    var topic = await fetchWithTimeout(`/content/channels/${channelId}/topics?agent=${token}`,
      { method: 'POST', body: JSON.stringify({}) });
    checkResponse(topic);
    var slot = await topic.json();
    return slot.id;
  }  
  else if (assets == null || assets.length === 0) {
    var subject = { data: JSON.stringify(message, (key, value) => {
      if (value !== null) return value
    }), datatype };
    
    var topic = await fetchWithTimeout(`/content/channels/${channelId}/topics?agent=${token}&confirm=true`,
      { method: 'POST', body: JSON.stringify(subject) });
    checkResponse(topic);
    var slot = await topic.json();
    return slot.id;
  }
  else {
   
    var topic = await fetchWithTimeout(`/content/channels/${channelId}/topics?agent=${token}`,
      { method: 'POST', body: JSON.stringify({}) });
    checkResponse(topic);
    var slot = await topic.json();

    // add each asset
    message.assets = [];
    for (var asset of assets) {
      if (asset.image) {
        const formData = new FormData();
        formData.append('asset', asset.image);
        var transform = encodeURIComponent(JSON.stringify(["ithumb;photo", "icopy;photo"]));
        var topicAsset = await fetch(`/content/channels/${channelId}/topics/${slot.id}/assets?transforms=${transform}&agent=${token}`, { method: 'POST', body: formData });
        checkResponse(topicAsset);
        var assetEntry = await topicAsset.json();
        message.assets.push({
          image: {
            thumb: assetEntry.find(item => item.transform === 'ithumb;photo').assetId,
            full: assetEntry.find(item => item.transform === 'icopy;photo').assetId,
          }
        });
      }
      else if (asset.video) {
        const formData = new FormData();
        formData.append('asset', asset.video);
        var thumb = 'vthumb;video;' + asset.position;
        var transform = encodeURIComponent(JSON.stringify(["vlq;video", "vhd;video", thumb]));
        var topicAsset = await fetch(`/content/channels/${channelId}/topics/${slot.id}/assets?transforms=${transform}&agent=${token}`, { method: 'POST', body: formData });
        checkResponse(topicAsset);
        var assetEntry = await topicAsset.json();
        message.assets.push({
          video: {
            thumb: assetEntry.find(item => item.transform === thumb).assetId,
            lq: assetEntry.find(item => item.transform === 'vlq;video').assetId,
            hd: assetEntry.find(item => item.transform === 'vhd;video').assetId,
          }
        });
      }
      else if (asset.audio) {
        const formData = new FormData();
        formData.append('asset', asset.audio);
        var transform = encodeURIComponent(JSON.stringify(["acopy;audio"]));
        var topicAsset = await fetch(`/content/channels/${channelId}/topics/${slot.id}/assets?transforms=${transform}&agent=${token}`, { method: 'POST', body: formData });
        checkResponse(topicAsset);
        var assetEntry = await topicAsset.json();
        message.assets.push({
          audio: {
            label: asset.label,
            full: assetEntry.find(item => item.transform === 'acopy;audio').assetId,
          }
        });
      }
    }

    var subject = { data: JSON.stringify(message, (key, value) => {
      if (value !== null) return value
    }), datatype };
 
    var unconfirmed = await fetchWithTimeout(`/content/channels/${channelId}/topics/${slot.id}/subject?agent=${token}`, 
      { method: 'PUT', body: JSON.stringify(subject) });
    checkResponse(unconfirmed);

    var confirmed = await fetchWithTimeout(`/content/channels/${channelId}/topics/${slot.id}/confirmed?agent=${token}`,
      { method: 'PUT', body: JSON.stringify('confirmed') });
    checkResponse(confirmed);
    return slot.id;
  }
}

