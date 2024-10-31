import React, { useState } from 'react'; // Add useState from React
import { VStack, FormControl, FormLabel, Input, InputGroup, InputRightElement, Button, useToast } from "@chakra-ui/react"; // Import necessary Chakra components
import axios from 'axios'
import {useNavigate} from 'react-router-dom'

const Signup = () => {
    // Add useState hooks for form input fields

    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [password, setPassword] = useState("");
    const [pic, setPic] = useState("");
    const toast = useToast();
    const navigate = useNavigate();


    const submitHandler = async () => {
      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: 'Please Fill All The Fields',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom', // fixed typo: 'position' was misspelled as 'psoition'
        });
        return;
      }
    
      if (password !== confirmPassword) {
        toast({
          title: 'Passwords do not match',
          status: 'warning',
          duration: 5000,
          isClosable: true,
          position: 'bottom', // fixed typo here too
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
          "http://localhost:3000/api/user",
          {
            name,
            email,
            password,
            pic,
          },
          config
        );
        console.log(data);

        // Assuming the token is returned in the response data
        const { token } = data; // Make sure the token is part of the response

        toast({
          title: "Registration Successful",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
        localStorage.setItem("userInfo", JSON.stringify(data));
        localStorage.setItem("token", token); // Store token
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
        <FormControl id="first-name" isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            placeholder="Enter Your Name"
            onChange={(e) => setName(e.target.value)} // Set the name when the input changes
          />
        </FormControl>
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
      <FormControl id="password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup size="md">
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm password"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>
      {/* <FormControl>
        <FormLabel>Uplaod Your Picture</FormLabel>
        <Input
        type="file"
        p={1.5}
        accept='image/*'
        onChange={(e)=>postDetails(e.target.files[0])} //the first image as input
         />
      </FormControl> */}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
      >
        Sign Up
      </Button>
      </VStack>
    );
};

export default Signup;
