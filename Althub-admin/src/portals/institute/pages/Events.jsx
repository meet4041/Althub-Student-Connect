import PortalEventsPage from '../../shared/pages/PortalEventsPage.jsx';

export default function Events() {
  return (
    <PortalEventsPage
      config={{
        breadcrumb: 'Events',
        title: 'Events Management',
        subtitle: 'Create, review, and manage institute events with a consistent control layout.',
        addPath: '/add-event',
        editPath: '/edit-event',
        emptyText: 'Create your first institute event to get started',
      }}
    />
  );
}
