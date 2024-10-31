import React, { useState } from 'react'; // Add useState from React
import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast} from "@chakra-ui/react"; // Import necessary Chakra components
import axios from 'axios'
import {useNavigate} from 'react-router-dom'


const Login = () => {
  // Add useState hooks for form input fields

  const [show, setShow] = useState(false);
  const handleClick = () => setShow(!show);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pic, setPic] = useState("");
  const toast = useToast();
  const navigate = useNavigate();


  const submitHandler = async () => {
    if (!email || !password) {
      toast({
        title: 'Please Fill All The Fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom', 
      });
      return;
    }
  
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
        },
      };
      const { data } = await axios.post(
        "http://localhost:3000/api/user/login",
        {
          email,
          password,
        },
        config
      );
      //console.log(data);
      // Assuming the token is returned in the response data
      const { token } = data; // Make sure the token is part of the response

      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      localStorage.setItem("userInfo", JSON.stringify(data)); //storing data on local disc
      localStorage.setItem("token", token); // Store token
      console.log('Stored Token:', localStorage.getItem("token")); // Check stored token

      //this is for using further in the app
      navigate("/chats"); // Updated navigation logic
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: error.response.data.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };


  return (
    <VStack spacing="5px">
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          onChange={(e) => setEmail(e.target.value)} // Set the name when the input changes
        />
      </FormControl>
      <FormControl id="password" isRequired>
      <FormLabel>Password</FormLabel>
      <InputGroup size="md">
        <Input
          type={show ? "text" : "password"}
          placeholder="Enter Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <InputRightElement width="4.5rem">
          <Button h="1.75rem" size="sm" onClick={handleClick}>
            {show ? "Hide" : "Show"}
          </Button>
        </InputRightElement>
      </InputGroup>
    </FormControl>
    
    <Button
      colorScheme="blue"
      width="100%"
      style={{ marginTop: 15 }}
      onClick={submitHandler}
    >
      Login
    </Button>
    </VStack>
  );
}

export default Login
