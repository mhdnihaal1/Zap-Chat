import User from "../utils/Schemas/User.js";
import { generateToken04 } from "../utils/TokenGenerator.js";

export const checkUser = async (req, res, next) => {
  try {
    console.log("checkUser");
    const { email } = req.body;
    if (!email) {
      return res.json({ message: "Email is required.", status: false });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: "User not found", status: false });
    } else {
      return res.json({ message: "User  found", status: true, data: user });
    }
  } catch (error) {
    console.log(error);
  }
};

export const onBoardUser = async (req, res, next) => {
  try {
    console.log("onBoardUser");
    const { email, name, about, image: profilePicture } = req.body;
    if (!email || !name || !profilePicture) {
      return res.send("Email, Name and Image are required");
    }

    const user = await User.create({ email, name, about, profilePicture });

    return res.json({ message: "Successfully Done", status: true, user });
  } catch (error) {
    console.log(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    console.log("getAllUsers");
    const { email } = req.query; // get email from query params

    const users = await User.find({ email: { $ne: email } })
      .sort({ name: -1 })
      .select("id email name profilePicture about");

    const usersGroupedByInitialLetter = {};
    users.forEach((user) => {
      const initailLetter = user.name.charAt(0).toUpperCase();
      if (!usersGroupedByInitialLetter[initailLetter]) {
        usersGroupedByInitialLetter[initailLetter] = [];
      }
      usersGroupedByInitialLetter[initailLetter].push(user);
    });
    return res.status(200).send({ users: usersGroupedByInitialLetter });
  } catch (error) {
    console.log(error);
  }
};

export const generateToken = async (req, res, next) => {
  try {
    console.log("geneateToken");
 
    const appId = parseInt(process.env.ZEGO_APP_ID);
    const serverSecret = process.env.ZEGO_SERVER_ID;
    const { userId } = req.body;    
     const effectiveTime = 3600;
    const payload = "";
     if (appId && serverSecret && userId) {
      const token = generateToken04(
        appId,
        userId,
        serverSecret,
        effectiveTime,
        payload
      );
       return res.status(200).send({ token });
    }
    return res
      .status(400)
      .send("User id, app id and server secret is required.");
  } catch (error) {
    console.log(error);
  }
};
