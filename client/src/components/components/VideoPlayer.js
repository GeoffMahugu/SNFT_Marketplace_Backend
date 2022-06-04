import React, { useState } from 'react'
import ReactPlayer from 'react-player'

export default function VideoPlayer({ videoURL }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className='nft__item_video' onClick={() => setPlaying(!playing)}>
      <ReactPlayer
        width='100%'
        height='100%'
        onClickPreview={() => setPlaying(!playing)}
        playing={playing}
        controls
        url={
          videoURL
            ? videoURL
            : 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4'
        }
      />
      {!playing && (
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            backgroundColor: '#8364e2',
            position: 'absolute',
            zIndex: 9999,
            left: '43%',
            top: '23%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '15px',
          }}
          onClick={() => setPlaying(!playing)}
        >
          <i
            className=' fa fa-play'
            style={{
              color: '#ffffff',
            }}
          ></i>
        </div>
      )}
    </div>
  );
}
