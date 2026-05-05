import EventForm from '../../shared/forms/EventForm.jsx';

export default function AlumniEditEvent() {
  return (
    <EventForm
      config={{
        mode: 'edit',
        editTitle: 'Edit Alumni Event',
        subtitle: 'Update the alumni event details and add new media.',
        backPath: '/alumni-events',
        successPath: '/alumni-events',
      }}
    />
  );
}
