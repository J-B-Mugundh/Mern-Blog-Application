import { Link } from "react-router-dom";
import { useContext, useEffect } from "react";
import { UserContext } from "./UserContext";

export default function Header() {
  const { setUserInfo, userInfo } = useContext(UserContext);

  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      if (response.ok) {
        response.json().then(userInfo => {
          setUserInfo(userInfo);
        });
      } else {
        setUserInfo(null); // Set user info to null if profile fetch fails
      }
    }).catch(error => {
      console.error('Error fetching profile:', error);
      setUserInfo(null); // Set user info to null if an error occurs
    });
  }, [userInfo, setUserInfo]); // Include userInfo and setUserInfo in the dependency array

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    }).then(() => {
      setUserInfo(null);
    }).catch(error => {
      console.error('Error logging out:', error);
    });
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">MyBlog</Link>
      <nav>
        {username && (
          <>
            <Link to="/create" style={buttonStyle}>Create new post</Link>
            <a onClick={logout} style={buttonStyle}>Logout ({username})</a>
          </>
        )}
        {!username && (
          <>
            <Link to="/login" style={buttonStyle}>Login</Link>
            <Link to="/register" style={buttonStyle}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

const buttonStyle = {
  padding: '10px',
  marginRight: '10px',
  textDecoration: 'none',
  color: '#fff',
  backgroundColor: '#007bff',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
};

