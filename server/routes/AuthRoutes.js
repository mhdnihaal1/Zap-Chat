import  { Router } from  "express";
import { checkUser , onBoardUser , getAllUsers, generateToken} from "../controllers/AuthController.js";


const router =  Router();


router.post("/check-User",checkUser);
router.post("/onboard-User",onBoardUser);
router.get("/get-contacts",getAllUsers);

router.post("/generate-token", generateToken);



export default router; 