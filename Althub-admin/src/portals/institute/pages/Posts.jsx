import PortalPostsPage from '../../shared/pages/PortalPostsPage.jsx';

export default function Posts() {
  return (
    <PortalPostsPage
      config={{
        breadcrumb: 'Posts Feed',
        title: 'Feed Management',
        subtitle: 'Review published content, keep media tidy, and manage feed activity in one place.',
        addPath: '/add-post',
        editPath: '/edit-post',
      }}
    />
  );
}
