import { Container } from "react-bootstrap";
import { useSelector } from "react-redux";

const Home = () => {
  const userStore = useSelector((store) => store.userStore);

  return (
    <Container className="p-5 bg-primary-subtle">
      <h1>Home</h1>
      <h4>Welcome {userStore.name}</h4>
    </Container>
  );
};

export default Home;
