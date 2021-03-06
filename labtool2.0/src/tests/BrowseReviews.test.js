import React from 'react'
import { BrowseReviews } from '../components/pages/BrowseReviews'
import { shallow } from 'enzyme'

describe('<BrowseReviews />', () => {
  let wrapper

  const coursePage = {
    id: 10011,
    name: 'Aineopintojen harjoitustyö: Tietorakenteet ja algoritmit',
    start: '2018-03-11T21:00:00.000Z',
    end: '2018-04-29T21:00:00.000Z',
    active: true,
    weekAmount: 7,
    weekMaxPoints: 3,
    currentWeek: 1,
    ohid: 'TKT20010.2018.K.A.1',
    teacherInstances: [
      {
        id: 10001,
        admin: true,
        userId: 10010,
        courseInstanceId: 10011,
        firsts: 'Pää',
        lastname: 'Opettaja'
      },
      {
        id: 10011,
        admin: true,
        userId: 10015,
        courseInstanceId: 10011,
        firsts: 'Ossi Ohjaaja',
        lastname: 'Mutikainen'
      }
    ]
  }

  const courseData = {
    role: 'teacher',
    data: [
      {
        id: 10012,
        github: 'http://github.com/tiralabra2',
        projectName: 'Tiran toinen labraprojekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10012,
        teacherInstanceId: 10011,
        weeks: [],
        User: {
          id: 10012,
          username: 'tiraopiskelija2',
          email: 'johan.studerande@helsinki.fi',
          firsts: 'Johan Wilhelm',
          lastname: 'Studerande',
          studentNumber: '014553242',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        }
      },
      {
        id: 10031,
        github: 'http://github.com/superprojekti',
        projectName: 'Tira super projekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-06-05T07:12:28.603Z',
        courseInstanceId: 10011,
        userId: 10031,
        teacherInstanceId: 10011,
        weeks: [],
        User: {
          id: 10031,
          username: 'superopiskelija',
          email: 'teras.henkilo@helsinki.fi',
          firsts: 'Teräs',
          lastname: 'Henkilö',
          studentNumber: '014666666',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        }
      },
      {
        id: 10011,
        github: 'http://github.com/tiralabra1',
        projectName: 'Tiran labraprojekti',
        createdAt: '2018-03-26T00:00:00.000Z',
        updatedAt: '2018-03-26T00:00:00.000Z',
        courseInstanceId: 10011,
        userId: 10011,
        teacherInstanceId: 10011,
        weeks: [
          {
            id: 10002,
            points: 2,
            weekNumber: 2,
            feedback: 'Melko hienoa työtä!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10001,
            points: 3,
            weekNumber: 1,
            feedback: 'Hienoa työtä!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10003,
            points: 3,
            weekNumber: 3,
            feedback: 'Erittäin hienoa työtä!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          },
          {
            id: 10004,
            points: 3,
            weekNumber: 4,
            feedback: 'Hyvin menee!',
            createdAt: '2018-03-26T00:00:00.000Z',
            updatedAt: '2018-03-26T00:00:00.000Z',
            studentInstanceId: 10011,
            comments: []
          }
        ],
        User: {
          id: 10011,
          username: 'tiraopiskelija1',
          email: 'maarit.opiskelija@helsinki.fi',
          firsts: 'Maarit Mirja',
          lastname: 'Opiskelija',
          studentNumber: '014578343',
          admin: false,
          createdAt: '2018-03-26T00:00:00.000Z',
          updatedAt: '2018-03-26T00:00:00.000Z'
        }
      }
    ]
  }

  const loading = {
    loading: false,
    loadingHooks: [],
    redirect: false,
    redirectHooks: [],
    redirectFailure: false
  }

  let mockFn = jest.fn()

  beforeEach(() => {
    wrapper = shallow(
      <BrowseReviews getOneCI={mockFn} coursePageInformation={mockFn} courseData={courseData} selectedInstance={coursePage} loading={loading} resetLoading={mockFn} initialLoading={false} />
    )
  })

  describe('BrowseReviews Component', () => {
    it('is ok', () => {
      true
    })

    it('should render without throwing an error', () => {
      expect(wrapper.find('.BrowseReviews').exists()).toEqual(true)
    })

    it('should render correctly', () => {
      expect(wrapper).toMatchSnapshot()
    })
  })
})
