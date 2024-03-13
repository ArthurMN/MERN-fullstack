import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, Link, useLocation } from "react-router-dom";

import { useSendLogoutMutation } from "../features/auth/authApiSlice";

const DASH_REGEX = /^\/dash(\/)?$/;
const NOTES_REGEX = /^\/dash\/notes(\/)?$/;
const USERS_REGEX = /^\/dash\/users(\/)?$/;

const DashHeader = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [sendLogout, { isLoading, isError, error }] =
    useSendLogoutMutation();

  //console.log(isSuccess)
  //console.log(isError)

  const logoutHandler = async () => {
    try {
      await sendLogout({}).unwrap();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return <p>Logging Out...</p>;

  if (isError) return <p>Error: {error.message}</p>;

  let dashClass = null;
  if (
    !DASH_REGEX.test(pathname) &&
    !NOTES_REGEX.test(pathname) &&
    !USERS_REGEX.test(pathname)
  ) {
    dashClass = "dash-header__container--small";
  }

  const logoutButton = (
    <button className="icon-button" title="Logout" onClick={logoutHandler}>
      <FontAwesomeIcon icon={faRightFromBracket} />
    </button>
  );

  const content = (
    <header className="dash-header">
      <div className={`dash-header__container ${dashClass}`}>
        <Link to="/dash">
          <h1 className="dash-header__tittle">techNotes</h1>
        </Link>
        <nav className="dash-header__nav">
          {/* Add more buttons */}
          {logoutButton}
        </nav>
      </div>
    </header>
  );

  return content;
};

export default DashHeader;
