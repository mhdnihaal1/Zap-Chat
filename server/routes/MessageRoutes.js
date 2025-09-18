
import { Router } from "express";
import { addMessage ,getMessages ,addImageMessage ,addAudioMessage ,getInitialContactsWithMessages} from "../controllers/MessageController.js";
import multer from "multer";

const router = Router();

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    const date = Date.now();
    cb(null, date + "-" + file.originalname);
  },
});

const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/recordings");
  },
  filename: (req, file, cb) => {
    const date = Date.now();
    cb(null, date + "-" + file.originalname);
  },
});

 const uploadAudio = multer({ storage:audioStorage });

 const uploadImage = multer({ storage:imageStorage });


router.post("/add-message", addMessage);
router.get("/get-messages/:from/:to", getMessages);
router.post("/add-image-message", uploadImage.single("image"), addImageMessage);

router.post("/add-audio-message", uploadAudio.single("audio"), addAudioMessage); 
router.get("/get-initial-contacts/:from", getInitialContactsWithMessages); 
              // get-initial-contacts

export default router;
  