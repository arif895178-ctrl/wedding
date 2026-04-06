"C:\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe" -i video.mp4 -vf "fps=24,scale=720:1280" -qscale:v 1 frames\frame%03d.jpg
