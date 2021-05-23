import express from "express";
import {
  getEdit,
  postEdit,
  logout,
  see,
  startGithubLogin,
  finishGithubLogin,
  getChangePassword,
  postChangePassword,
  startKakaoLogin,
  getTokenKakaoLogin,
} from "../controllers/userController";
import {
  protectorMiddleware,
  publicOnlyMiddleware,
  avatarUpload,
} from "../middlewares";

const userRouter = express.Router();

//로그아웃
userRouter.get("/logout", protectorMiddleware, logout);

// 아바타 수정하기
userRouter
  .route("/edit")
  .all(protectorMiddleware)
  .get(getEdit)
  .post(avatarUpload.single("avatar"), postEdit);

// 비밀번호 변경
userRouter
  .route("/change-password")
  .all(protectorMiddleware)
  .get(getChangePassword)
  .post(postChangePassword);

//깃허브 소셜 로그인
userRouter.get("/github/start", publicOnlyMiddleware, startGithubLogin);
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin);

//카톡 소셜 로그인
userRouter.get("/kakao/start", publicOnlyMiddleware, startKakaoLogin);
userRouter.get("/kakao/permit", getTokenKakaoLogin);
// userRouter.get("/kakao/finish", publicOnlyMiddleware, finishKakaoLogin);

userRouter.get("/:id", see);

export default userRouter;
