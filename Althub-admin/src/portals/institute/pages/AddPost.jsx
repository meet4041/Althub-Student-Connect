import PostForm from '../../shared/forms/PostForm.jsx';

export default function AddPost() {
  return (
    <PostForm
      config={{
        title: 'Create Community Post',
        subtitle: 'Share an update with your students.',
        backPath: '/posts',
        successPath: '/posts',
        placeholder: 'Share an update with your students...',
      }}
    />
  );
}
