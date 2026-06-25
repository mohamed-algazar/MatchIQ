import cv2

def read_video(video_path, max_frames=500):
    cap = cv2.VideoCapture(video_path)
    frames = []
    count = 0
    while count < max_frames:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Memory optimization: Resize to 640x360 (360p) to fit in RAM
        height, width = frame.shape[:2]
        if width > 640:
            aspect_ratio = height / width
            new_width = 640
            new_height = int(new_width * aspect_ratio)
            frame = cv2.resize(frame, (new_width, new_height), interpolation=cv2.INTER_AREA)
            
        frames.append(frame)
        count += 1
    cap.release()
    return frames

def save_video(ouput_video_frames,output_video_path):
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(output_video_path, fourcc, 24, (ouput_video_frames[0].shape[1], ouput_video_frames[0].shape[0]))
    for frame in ouput_video_frames:
        out.write(frame)
    out.release()
