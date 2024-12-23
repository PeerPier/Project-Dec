import { useContext, useEffect } from "react";
import {
  FaRegHeart,
  FaHeart,
  FaRegCommentDots,
  FaTwitter,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { BlogContext } from "./blog.page";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "../api/post";

const BlogInteraction = () => {
  const blogContext = useContext(BlogContext);
  const userContext = useContext(UserContext);

  if (!blogContext || !userContext) {
    return null;
  }

  const {
    blog,
    blog: { _id, topic, blog_id, activity, activity: blogActivity, author },
    setBlog,
    islikedByUser,
    setLikeByUser,
    setCommentWrapper,
  } = blogContext;

  const total_likes = blogActivity?.total_likes || 0;
  const total_comments = blogActivity?.total_comments || 0;
  const author_username = author?.username || "Unknown";

  let {
    userAuth: { username, access_token },
  } = userContext;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (access_token) {
      axios
        .post(
          API_BASE_URL + "/create-blog/isliked-by-user", // Call your new API
          { _id },
          {
            headers: {
              Authorization: `Bearer ${access_token}`, // Attach the token
            },
          }
        )
        .then(({ data: { result } }) => {
          setLikeByUser(Boolean(result)); // Set the like status
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [access_token, _id, setLikeByUser]);

  const handleLike = () => {
    if (access_token) {
      setLikeByUser(!islikedByUser); // Toggle like status in the UI

      // Calculate the new total likes
      const newTotalLikes = !islikedByUser ? total_likes + 1 : total_likes - 1;

      // Update blog's total likes in state
      setBlog({
        ...blog,
        activity: {
          ...activity,
          total_likes: newTotalLikes,
          total_comments: activity?.total_comments || 0,
        },
      });

      // Send the like/dislike request to the server
      axios
        .post(
          API_BASE_URL + "/create-blog/like-blog", // Assuming this is your like/unlike API
          {
            _id,
            islikedByUser,
          },
          {
            headers: {
              Authorization: `Bearer ${access_token}`, // Attach token
            },
          }
        )
        .then(({ data }) => {
          // console.log(data); // Handle successful response
        })
        .catch((err) => {
          console.log(err); // Handle error
        });
    } else {
      toast.error("กรุณาเข้าสู่ระบบก่อนไลค์บล็อก"); // Show error if not logged in
    }
  };

  return (
    <>
      <Toaster />
      <hr className="border-grey my-2" />

      <div className="d-flex gap-2 justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <button
            className={
              "rounded-circle d-flex align-items-center justify-content-center " +
              (islikedByUser ? "liked" : "not-liked")
            }
            style={{
              width: "2.5rem",
              height: "2.5rem",
            }}
            onClick={handleLike}
          >
            {islikedByUser ? <FaHeart /> : <FaRegHeart />}
          </button>
          <p className="m-0" style={{ color: "#494949" }}>
            {total_likes}
          </p>

          <button
            onClick={() => setCommentWrapper((prevVal) => !prevVal)}
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{
              width: "2.5rem",
              height: "2.5rem",
              backgroundColor: "#f0f0f1",
            }}
          >
            <FaRegCommentDots />
          </button>
          <p className="m-0" style={{ color: "#494949" }}>
            {total_comments}
          </p>
        </div>

        <div className="d-flex gap-2 align-items-center">
          {username === author_username ? (
            <Link
              to={`/editor/${blog_id}`}
              className="underline text-purple"
              style={{
                color: "inherit",
              }}
            >
              แก้ไข
            </Link>
          ) : (
            ""
          )}

          <Link
            to={`https://twitter.com/intent/tweet?text=Read ${topic}&url=${window.location.href}`}
            style={{
              color: "inherit",
            }}
          >
            <FaTwitter className="text-twitter" />
          </Link>
        </div>
      </div>

      <hr className="border-grey my-2" />
    </>
  );
};

export default BlogInteraction;