import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const actionBtn = document.getElementById("actionBtn");
const desc = document.getElementById("desc");
const btnContainer = document.getElementsByClassName("upload__video");
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
  actionBtn.innerText = "Downloading";
  // actionBtn.innerText = "Transcoding...";

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
// 버튼 문구 변경 : 레코딩 -> stop recording -> downloading ->  record again
const handleStart = () => {
  // 버튼에 걸어놓았던 이벤트 등 제거
  actionBtn.innerText = `Stop Recording`;
  actionBtn.disabled = false;
  actionBtn.removeEventListener("click", handleStart);
  // 레코더 장치 설정
  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  // 스탑버튼 심기
  actionBtn.addEventListener("click", () => {
    recorder.stop();
  });
  // 해당 장치에 레코딩 이벤트(ondataavailable) = 레코딩 스탑 시 설정
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data); // videoFile에 이벤트의 메모리 상에 저장된 데이터의 주소를 따서 담는다.
    video.srcObject = null; // 소스 오브젝트 초기화
    video.src = videoFile; // 소스에 비디오파일 url을 넣기
    // video.loop = true; // 루프 설정
    // video.play(); // 레코딩이 끝나면 자동 재생
    handleDownload(); // 다운로드 핸들러 시작
    actionBtn.removeEventListener("click", () => {
      recorder.stop(); // 레코딩 스탑 이벤트 제거
    });
  };
  // 레코딩을 시작시킨다.()
  recorder.start();
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
  // desc.setAttribute("class", "desc");
  const line_head = document.createElement("p");
  line_head.innerText = " 레코딩 이용 가이드";
  const line_1 = document.createElement("li");
  line_1.innerText = "1️ Start Recording 버튼을 누르면 녹화가 시작됩니다.";
  const line_2 = document.createElement("li");
  line_2.innerText =
    "2 Stop Recording 버튼을 누르면 녹화가 종료되면서 자동으로 영상과 섬네일이 다운로드 됩니다.";
  const line_3 = document.createElement("li");
  line_3.innerText =
    "3️ 다운로드 하는데 다소 시간이 소요되니 양해부탁드립니다.";
  const line_4 = document.createElement("li");
  line_4.innerText = "4️ 다운된 영상 및 섬네일 파일을 아래 업로드 해주세요!";
  const line_5 = document.createElement("li");
  line_5.innerText =
    "v 스마트폰에서는 녹화 및 파일 첨부 기능이 지원되지 않습니다. 데스크탑이나 노트북을 이용 부탁드립니다.";
  const line_6 = document.createElement("li");
  line_6.innerText =
    "v 10초 이상의 영상을 만드실 때는 다른 기기를 이용하여 녹화한 영상파일을 업로드 하시기 바랍니다. 😀";
  desc.append(line_head, line_1, line_2, line_3, line_4, line_5, line_6);
};

init();

actionBtn.addEventListener("click", handleStart);
