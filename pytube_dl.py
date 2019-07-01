from pytube import YouTube

yt = YouTube('https://www.youtube.com/watch?v=gUsyr7s_G1o')
yt.streams.filter(resolution='720p').first().download("E:/Dev/videos", "gUsyr7s_G1o")