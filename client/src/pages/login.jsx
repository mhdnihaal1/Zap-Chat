import { firebaseAuth } from "@/utils/FirebaseConfig";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import Image from "next/image";
import React, { useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { useRouter } from "next/router";
import axios from "axios";
import { CHECK_USER_ROUTE } from "../utils/ApiRoutes.js";
import { useStateProvider } from "@/context/StateContext.jsx";
import { reducerCases } from "@/context/constants.js";

function Login() {
  const router = useRouter();

  const [{ userInfo, newUser }, dispatch] = useStateProvider();
  useEffect(() => {
    if (userInfo?.id && !newUser) router.push("/");
  }, [userInfo, newUser]);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const {
        user: { displayName: name, email, photoURL: profileImage },
      } = await signInWithPopup(firebaseAuth, provider);
      const { data } = await axios.post(
        `http://localhost:5000/api/auth/check-user`,
        { email }
      );
      if (email) {
        if (!data?.status) {
          dispatch({ type: reducerCases.SET_NEW_USER, newUser: true });
           dispatch({
            type: reducerCases.SET_USER_INFO,
            userInfo: {
              name,
              email,
              profileImage: data?.data?.profilePicture || "/default_avatar.png",
              status: "Available",
            },
          });

          router.push("/onboarding");
        } else {
console.log(12)
//  do not un comment this . this will affect login
          // dispatch({
          //   type: reducerCases.SET_USER_INFO,
          //   userInfo: {
          //     name,
          //     email,
          //     profileImage: data?.data?.profilePicture || "/default_avatar.png",
          //     status: "Available",
          //   },
          // });
          router.push("/");
        }
      } else {
        const { id, name, email, profileImage, status } = data?.data;
 
        dispatch({
          type: reducerCases.SET_USER_INFO,
          userInfo: {
            id,
            name,
            email,
            profileImage: data?.data?.profilePicture || "/default_avatar.png",
            status,
          },
        });

        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex justify-center items-center bg-panel-header-background h-screen w-screen flex-col gap-6">
      <div className="flex flex-col items-center justify-center gap-6 text-white">
        {/* Logo + title */}
        <div className="flex items-center gap-2">
          <Image src="/whatsapp.gif" alt="ZapChat" height={300} width={300} />
          <span className="text-7xl font-bold">ZapChat</span>
        </div>

        {/* Login button */}
        <button
          className="flex items-center justify-center gap-4 bg-search-input-container-background px-6 py-3 rounded-lg hover:bg-opacity-80 transition-all"
          onClick={handleLogin}
        >
          <FcGoogle className="text-3xl" />
          <span className="text-white text-xl font-medium">
            Sign in with Google
          </span>
        </button>
      </div>
    </div>
  );
}

export default Login;
