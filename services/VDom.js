export const VDom = {
  createElement(type, { key = null, ...props } = {}, ...children) {
    if (children.length === 1) {
      props.children = children[0];
    } else {
      props.children = children;
    }

    return {
      type,
      key,
      props
    };
  }
};
