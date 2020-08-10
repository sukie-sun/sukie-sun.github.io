!function () {
  if ('none' !== $('.left-col').css('display')) {
    const e = new APlayer({
      element: document.getElementById('aplayer'),
      mutex: !0,
      theme: '#EBEEDF',
      order: 'random',
      lrcType: 3,
      fixed: !0
    })
    var xhr = new XMLHttpRequest, listid = 883067320 // 歌单 ID
    xhr.open('get', 'https://api.i-meto.com/meting/api?server=netease&type=playlist&id=' + listid), xhr.onreadystatechange = function () {
      4 === xhr.readyState && (200 === xhr.status ? (e.list.add(JSON.parse(xhr.responseText)), e.play()) : (e.list.add({ // 获取失败时的默认歌曲
        title: 'Fell For U',
        author: 'Noicybino',
        url: 'https://example.com/FellForU.mp3',
        pic: '/img/love.png',
        lrc: ''
      }), e.play()))
    }, xhr.send()
  }
}()