import React from "react";
import './ResultPlaylist.scss'

export default function ResultPlaylist({track, reroll}){

    return(
    <div className="ResultPlaylistCard">
            <img src={track.imageUrl} />
            <div className="text">
                <div className="title">{track.name}</div>
                <div className="cardArtist">{track.artist}</div>
            </div>
            <button id="roll" onClick={() => reroll(track)}>X</button>
        </div>
    )
}