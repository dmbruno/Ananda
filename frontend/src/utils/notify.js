import { toast } from 'react-toastify';


const defaultOpts = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  pauseOnHover: true,
  closeOnClick: true,
};

const notify = {
  success: (msg, opts = {}) => toast.success(msg, { ...defaultOpts, ...opts }),
  error:   (msg, opts = {}) => toast.error(msg, { ...defaultOpts, ...opts }),
  info:    (msg, opts = {}) => toast.info(msg, { ...defaultOpts, ...opts }),
  warn:    (msg, opts = {}) => toast.warn(msg, { ...defaultOpts, ...opts }),
  custom:  (content, opts = {}) => toast(content, { ...defaultOpts, ...opts }),
};

export default notify;