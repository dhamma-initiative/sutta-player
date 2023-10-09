for file in /home/ash/prj/di/KN/Thag/*.mp3; do
    filename=$(basename "$file")
    duration=$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$file")
    echo "$filename, $duration"
done