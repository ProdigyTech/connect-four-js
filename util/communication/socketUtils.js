const socketUtils = [
  {
    on: "connected",
    callback: (e) => {
      console.log("client connected, ", e);
    },
  },
];


export default socketUtils;