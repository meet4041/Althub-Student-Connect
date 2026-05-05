import PortalPostsPage from '../../shared/pages/PortalPostsPage.jsx';

export default function AlumniPosts() {
  return (
    <PortalPostsPage
      config={{
        breadcrumb: 'Alumni Posts',
        title: 'Alumni Posts',
        subtitle: 'Create, review, and manage alumni posts from the shared admin feed workspace.',
        addPath: '/alumni-add-post',
        editPath: '/alumni-edit-post',
      }}
    />
  );
}
