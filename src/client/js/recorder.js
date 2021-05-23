import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumb: "thumbnail.jpg",
};

const downloadFile = (fileUrl, fileName) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
};

// 다운로드 버튼
const handleDownload = async () => {
  // 이벤트 제거
  actionBtn.removeEventListener("click", handleDownload);

  actionBtn.innerText = "Transcoding...";

  actionBtn.disabled = true;

  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));

  await ffmpeg.run("-i", files.input, "-r", "60", files.output);

  await ffmpeg.run(
    "-i",
    files.input,
    "-ss",
    "00:00:01",
    "-frames:v",
    "1",
    files.thumb
  );

  const mp4File = ffmpeg.FS("readFile", files.output);
  const thumbFile = ffmpeg.FS("readFile", files.thumb);

  const mp4Blob = new Blob([mp4File.buffer], { type: "video/mp4" });
  const thumbBlob = new Blob([thumbFile.buffer], { type: "image/jpg" });

  const mp4Url = URL.createObjectURL(mp4Blob);
  const thumbUrl = URL.createObjectURL(thumbBlob);

  downloadFile(mp4Url, "MyRecording.mp4");
  downloadFile(thumbUrl, "MyThumbnail.jpg");

  ffmpeg.FS("unlink", files.input);
  ffmpeg.FS("unlink", files.output);
  ffmpeg.FS("unlink", files.thumb);

  URL.revokeObjectURL(mp4Url);
  URL.revokeObjectURL(thumbUrl);
  URL.revokeObjectURL(videoFile);

  actionBtn.disabled = false;
  actionBtn.innerText = "Record Again";
  actionBtn.addEventListener("click", handleStart);
};

// 스타트 레코딩
const handleStart = () => {
  // 버튼에 걸어놓았던 이벤트 등 제거
  actionBtn.innerText = "Recording";
  actionBtn.disabled = true;
  actionBtn.removeEventListener("click", handleStart);
  // 미디어 입력장치로 입력된 스트림 파일을 프로미스 then으로 반환하고, 이를 recoder 변수에 담는다.
  // 레코더 장치를 설정하는 것
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  // 해당 장치에 레코딩 이벤트(ondataavailable)가 실행될 때의 설정
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); // videoFile에 이벤트의 메모리 상에 저장된 데이터의 주소를 따서 담는다.
    video.srcObject = null; // 소스 오브젝트 초기화
    video.src = videoFile; // 소스에 비디오파일 url을 넣기
    video.loop = true; // 루프 설정
    video.play(); // 레코딩이 끝나면 자동 재생
    actionBtn.innerText = "Download"; // 아래는 레코딩이 끝나면 이벤트 원복
    actionBtn.disabled = false;
    actionBtn.addEventListener("click", handleDownload); // 다운로드로 변경
  };
  // 레코딩을 시작시킨다.()
  recorder.start();
  setTimeout(() => {
    recorder.stop();
  }, 5000); // 5초 제한이 걸려있는데 이를 설정. 별도로 recorder.stop을 버튼에 이벤트리스너로 걸 수 있겠다.
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      width: 1024,
      height: 576,
    },
  }); // 미디어 입력장치 이용 허가를 받고 그 스트림 파일을 담는다.
  video.srcObject = stream; // 이를 video의 srcObject 속성에 넣는다.
  video.play(); // 미디어 입력장치로 들어오는 stream이 라이브로 재생된다.
};

init();

actionBtn.addEventListener("click", handleStart);
