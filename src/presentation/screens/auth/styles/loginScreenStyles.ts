import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdf2dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 260,
    height: 260,
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    fontFamily: 'Cochin',
  },
  inputContainer: {
    width: '80%',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: 12,
  },
  loginButton: {
    backgroundColor: '#fcd34d',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  forgotPassword: {
    color: '#333',
    marginTop: 20,
    textAlign: 'center',
  },
});
