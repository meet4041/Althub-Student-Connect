import express from "express";

import user_route from "./userRoute.js";
import event_route from "./eventRoute.js";
import institute_route from "./instituteRoute.js";
import course_route from "./courseRoute.js";
import feedback_route from "./feedbackRoute.js";
import post_route from "./postRoute.js";
import admin_route from "./adminRoute.js";
import conversation_route from "./conversationRoute.js";
import message_route from "./messageRoute.js";
import education_route from "./educationRoute.js";
import experience_route from "./experienceRoute.js";
import company_route from "./companyRoute.js";
import notification_route from "./notificationRoute.js";
import images_route from "./imagesRoute.js";
import portal_announcement_route from "./portalAnnouncementRoute.js";
import v1ResourceAliases from "./v1ResourceAliases.js";

export const createApiRouter = ({ apiLimiter, imageLimiter, loginLimiter, includeResourceAliases = false } = {}) => {
  const router = express.Router();

  router.use("/images", imageLimiter, images_route);
  router.use(apiLimiter);

  if (includeResourceAliases) {
    router.use(v1ResourceAliases);
  }

  router.post("/adminLogin", loginLimiter);
  router.post("/instituteLogin", loginLimiter);
  router.post("/userLogin", loginLimiter);

  router.use(user_route);
  router.use(event_route);
  router.use(institute_route);
  router.use(course_route);
  router.use(post_route);
  router.use(portal_announcement_route);
  router.use(admin_route);
  router.use(conversation_route);
  router.use(message_route);
  router.use(education_route);
  router.use(experience_route);
  router.use(feedback_route);
  router.use(company_route);
  router.use(notification_route);

  return router;
};
