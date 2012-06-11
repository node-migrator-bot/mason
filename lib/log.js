module.exports = function log(event, msg, sub) {
  if (sub) {
    console.log('\033[90m -> ' + msg + '\033[0m');
  }
  else {
    console.log('\033[32mMason:\033[0m \033[%sm%s\033[0m\033[90m - %s\033[0m', 
      (event === 'error' ? 101 : 36), 
      (event === 'error' ? ' ' + event + ' ' : event), 
      msg
    );
  }
};