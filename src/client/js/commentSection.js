const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");
const removeCommentBtn = document.getElementsByClassName("remove_comment");
const user = document.getElementById("comment_user");

const removeComment = async (comment, videoId) => {
  const response = await fetch(
    `/api/videos/${videoId}/comment/${comment.dataset.id}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status === 200) {
    comment.remove();
  }
};

const addComment = (text, commentId, videoId) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = commentId;
  newComment.className = "video__comment";
  const username = document.createElement("span");
  username.innerText = `${user.textContent}`;
  username.className = "username__comments";
  const icon = document.createElement("i");
  icon.className = "fas fa-comment";
  const span = document.createElement("span");
  span.innerText = ` ${text}`;
  const span2 = document.createElement("span");
  span2.innerText = "❌";
  span2.addEventListener("click", () => {
    removeComment(newComment, videoId);
  });
  newComment.appendChild(icon);
  newComment.appendChild(username);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") {
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  if (response.status === 201) {
    textarea.value = "";
    //생성된 코멘트id 반환
    const { newCommentId } = await response.json();
    addComment(text, newCommentId, videoId);
  }
};

if (form) {
  form.addEventListener("submit", handleSubmit);
}
